/**
 * Enterprise-grade cancellation rules engine
 * Inspired by Flipkart/Amazon policies
 */

// Free instant cancellation window (in milliseconds)
const INSTANT_CANCEL_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// Statuses that absolutely block cancellation
const BLOCKED_STATUSES = ['shipped', 'out_for_delivery', 'delivered', 'cancelled'];

// Statuses eligible for cancellation
const CANCELLABLE_STATUSES = ['pending', 'processing', 'cancel_requested'];

/**
 * Determines if an order can be cancelled and the type of cancellation.
 * 
 * @param {Object} order - The order object from the database
 * @returns {{ allowed: boolean, reason: string, type: 'instant'|'review'|null }}
 * 
 * Rules:
 * 1. Already cancelled → blocked
 * 2. Delivered → blocked (must use return flow)
 * 3. Shipped / Out for delivery → blocked
 * 4. Within 1 hour + status pending → instant free cancel
 * 5. Status pending/processing after 1 hour → needs admin review
 * 6. cancel_requested → already requested, wait for review
 */
export function canCancelOrder(order) {
    if (!order) {
        return { allowed: false, reason: 'Order not found.', type: null };
    }

    const status = order.status;

    // Rule 1: Already cancelled
    if (status === 'cancelled') {
        return { allowed: false, reason: 'This order has already been cancelled.', type: null };
    }

    // Rule 2: Delivered
    if (status === 'delivered') {
        return {
            allowed: false,
            reason: 'Delivered orders cannot be cancelled. Please initiate a return request instead.',
            type: null
        };
    }

    // Rule 3: Shipped or out for delivery
    if (status === 'shipped' || status === 'out_for_delivery') {
        return {
            allowed: false,
            reason: 'This order has already been dispatched and cannot be cancelled. Please refuse delivery or initiate a return after receiving.',
            type: null
        };
    }

    // Rule 6: Already requested cancellation, awaiting review
    if (status === 'cancel_requested') {
        return {
            allowed: false,
            reason: 'A cancellation request is already under review. Our team will process it shortly.',
            type: null
        };
    }

    // Check if status is in the cancellable list
    if (!CANCELLABLE_STATUSES.includes(status)) {
        return { allowed: false, reason: `Orders with status "${status}" cannot be cancelled.`, type: null };
    }

    const orderAge = Date.now() - new Date(order.createdAt).getTime();

    // Rule 4: Within instant cancel window AND still pending
    if (orderAge <= INSTANT_CANCEL_WINDOW_MS && status === 'pending') {
        return {
            allowed: true,
            reason: 'This order is eligible for instant cancellation.',
            type: 'instant'
        };
    }

    // Rule 5: Past instant window OR already processing → needs review
    return {
        allowed: true,
        reason: status === 'processing'
            ? 'This order is being prepared. Your cancellation request will be reviewed by our team.'
            : 'The free cancellation window has passed. Your request will be reviewed by our team.',
        type: 'review'
    };
}

/**
 * Standard cancellation reasons for the customer-facing dropdown.
 */
export const CANCEL_REASONS = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Ordered by mistake',
    'Delivery time is too long',
    'Duplicate order',
    'Payment issue',
    'Other'
];

/**
 * Builds a status history entry.
 * @param {string} status - New status
 * @param {string} actor - Who made the change (email or "customer")
 * @param {string} [note] - Optional note (e.g., cancel reason)
 * @returns {Object}
 */
export function buildStatusEntry(status, actor, note = null) {
    const entry = {
        status,
        timestamp: new Date().toISOString(),
        actor
    };
    if (note) entry.note = note;
    return entry;
}

/**
 * Parses the statusHistory JSON string from the database.
 * @param {string|null} historyJson
 * @returns {Array}
 */
export function parseStatusHistory(historyJson) {
    if (!historyJson) return [];
    try {
        return JSON.parse(historyJson);
    } catch {
        return [];
    }
}

/**
 * Appends a new entry to the status history and returns the JSON string.
 * @param {string|null} existingJson
 * @param {Object} newEntry
 * @returns {string}
 */
export function appendStatusHistory(existingJson, newEntry) {
    const history = parseStatusHistory(existingJson);
    history.push(newEntry);
    return JSON.stringify(history);
}

/**
 * Valid status transitions for the logistics pipeline.
 * Key = current status, Value = array of allowed next statuses.
 */
export const VALID_TRANSITIONS = {
    pending:            ['processing', 'cancelled', 'cancel_requested'],
    processing:         ['shipped', 'cancelled', 'cancel_requested'],
    cancel_requested:   ['cancelled', 'processing'], // admin can approve cancel or resume
    shipped:            ['out_for_delivery', 'delivered'],
    out_for_delivery:   ['delivered'],
    delivered:          ['return_requested'],
    return_requested:   ['delivered'], // admin can reject return
    cancelled:          [] // terminal state
};

/**
 * Checks if a status transition is valid.
 * @param {string} from - Current status
 * @param {string} to - Target status
 * @returns {boolean}
 */
export function isValidTransition(from, to) {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed) return false;
    return allowed.includes(to);
}

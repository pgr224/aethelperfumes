export default function TrustBar({ settings = {} }) {
    return (
        <div className="trust-bar">
            <div className="container">
                <div className="trust-grid">
                    <div className="trust-item">
                        <div className="trust-icon">✈️</div>
                        <div className="trust-text">
                            <h4>{settings.trust1Title || 'Global Logistics'}</h4>
                            <p>{settings.trust1 || 'Complimentary worldwide shipping on orders over $150.'}</p>
                        </div>
                    </div>
                    <div className="trust-item">
                        <div className="trust-icon">✨</div>
                        <div className="trust-text">
                            <h4>{settings.trust2Title || 'Artisanal Craft'}</h4>
                            <p>{settings.trust2 || 'Meticulously composed in Grasse with rare botanicals.'}</p>
                        </div>
                    </div>
                    <div className="trust-item">
                        <div className="trust-icon">🎁</div>
                        <div className="trust-text">
                            <h4>Luxury Gifting</h4>
                            <p>Every order arrives in our signature magnetic boutique box.</p>
                        </div>
                    </div>
                    <div className="trust-item">
                        <div className="trust-icon">🔒</div>
                        <div className="trust-text">
                            <h4>Secure Payment</h4>
                            <p>Encrypted checkout for a seamless and private experience.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

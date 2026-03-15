'use client';
export default function AboutPage() {
    return (
        <div className="about-page">
            <section className="about-hero">
                <div className="container">
                    <span className="subtitle">The Art of Essence</span>
                    <h1>Heritage & Craftsmanship</h1>
                </div>
            </section>

            <section className="section">
                <div className="container narrow">
                    <div className="about-intro">
                        <h2>Since 1924, Aethel has been a beacon of olfactory excellence in the heart of Grasse.</h2>
                        <p>Our story began with a simple belief: that a fragrance is not just a scent, but a silent language that speaks of character, memory, and emotion. For three generations, the Dumont family has meticulously sourced the world's most precious botanicals to create compositions that defy convention.</p>
                    </div>

                    <div className="about-grid">
                        <div className="about-image">
                            <img src="https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop" alt="Perfume Lab" />
                        </div>
                        <div className="about-text">
                            <h3>Sustainable Sophistication</h3>
                            <p>We treat the Earth with the same respect as our ingredients. Our "Field to Flacon" initiative ensures that every jasmine petal and sandalwood chip is harvested ethically and sustainably, preserving the traditions of Grasse for generations to come.</p>
                            <p>Every AETHEL bottle is hand-assembled in our atelier, reflecting a commitment to slow luxury that is rare in the modern world.</p>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .about-page {
                    background-color: #0a0a0a;
                    padding-top: 80px;
                }
                .about-hero {
                    height: 60vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?q=80&w=2000&auto=format&fit=crop');
                    background-size: cover;
                    background-position: center;
                }
                .subtitle {
                    color: #c9a96e;
                    text-transform: uppercase;
                    letter-spacing: 0.3em;
                    font-size: 0.8rem;
                    display: block;
                    margin-bottom: 20px;
                }
                .about-hero h1 {
                    font-size: 4.5rem;
                    color: #fff;
                }
                .container.narrow {
                    max-width: 1000px;
                }
                .about-intro {
                    text-align: center;
                    margin-bottom: 100px;
                }
                .about-intro h2 {
                    font-size: 2.5rem;
                    color: #fff;
                    margin-bottom: 30px;
                    line-height: 1.2;
                }
                .about-intro p {
                    font-size: 1.2rem;
                    color: #888;
                    max-width: 800px;
                    margin: 0 auto;
                    line-height: 1.8;
                }
                .about-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 80px;
                    align-items: center;
                }
                .about-image img {
                    width: 100%;
                    border-radius: 8px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                }
                .about-text h3 {
                    font-size: 2rem;
                    color: #fff;
                    margin-bottom: 25px;
                }
                .about-text p {
                    color: #888;
                    font-size: 1.1rem;
                    line-height: 1.8;
                    margin-bottom: 20px;
                }
                @media (max-width: 768px) {
                    .about-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }
                    .about-hero h1 {
                        font-size: 3rem;
                    }
                }
            `}</style>
        </div>
    );
}

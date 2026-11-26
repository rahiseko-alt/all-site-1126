import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero-section">
            <div className="hero-grid-bg"></div>

            <div className="hero-content container">
                <motion.div
                    className="hero-badge"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <Cpu className="text-neon-blue" size={20} />
                    <span className="en-text text-neon-blue">DECENTRALIZED AUTONOMY</span>
                </motion.div>

                <motion.div
                    className="hero-title-container"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <h1 className="hero-title en-text">
                        <span className="glitch-layer">AIUEO</span>
                    </h1>
                    <h2 className="hero-subtitle jp-text">中央集権からの独立宣言</h2>
                </motion.div>

                <motion.div
                    className="hero-desc jp-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                >
                    <p>
                        大手ベンダーへの絶対依存（ロックイン）を断ち切る。<br />
                        現場のリソースを最大化し、飲食店に圧倒的な実利と自由を取り戻す<br />
                        次世代の**自律分散型DXシステム**。
                    </p>
                </motion.div>

                <motion.div
                    className="scroll-down"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5, duration: 1 }}
                >
                    <span className="en-text text-neon-purple">INITIALIZE</span>
                    <div className="scroll-line"></div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;

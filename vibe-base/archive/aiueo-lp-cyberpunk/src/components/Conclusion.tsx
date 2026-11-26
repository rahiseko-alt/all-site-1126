import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import './Conclusion.css';

const Conclusion = () => {
    return (
        <section className="conclusion-section">
            <div className="container conclusion-container">

                <motion.div
                    className="conclusion-img-wrapper"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    <img src="/powered_suit.png" alt="Aiueo Powered Suit" className="conclusion-img" />
                    <div className="img-overlay"></div>
                </motion.div>

                <motion.div
                    className="conclusion-content"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    <div className="icon-wrapper">
                        <Terminal className="text-neon-pink" size={32} />
                    </div>

                    <h2 className="jp-text conclusion-title">
                        圧倒的な実利と自由を取り戻す<br />
                        <span className="text-neon-pink">パワードスーツ</span>
                    </h2>

                    <p className="jp-text conclusion-text">
                        「Aiueo」は単なるPOSシステムではありません。2026年のAI技術と高度なクラウドインフラをフル活用し、これまでの「大手による囲い込み」という鎖を完全に破壊します。
                    </p>
                    <p className="jp-text conclusion-text highlight">
                        現場が自らタイヤ交換できる四輪駆動車。<br />
                        それが、私たちの「Aiueo」です。
                    </p>

                    <motion.button
                        className="cta-button"
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255, 0, 85, 0.6)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="glitch-text" data-text="SYSTEM_ACCESS">SYSTEM_ACCESS</span>
                        <div className="btn-scanline"></div>
                    </motion.button>
                </motion.div>

            </div>
        </section>
    );
};

export default Conclusion;

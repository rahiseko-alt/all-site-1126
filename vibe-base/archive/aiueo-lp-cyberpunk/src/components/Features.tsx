import { motion } from 'framer-motion';
import { Database, RefreshCw, Printer } from 'lucide-react';
import './Features.css';

const Features = () => {
    return (
        <section className="features-section">
            <div className="container">

                <div className="section-header">
                    <motion.h2
                        className="en-text text-neon-blue"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        SYSTEM_ARCHITECTURE
                    </motion.h2>
                    <motion.p
                        className="jp-text section-desc"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        思想実現のためのコア機能
                    </motion.p>
                </div>

                <div className="features-grid">

                    {/* Feature 1 */}
                    <motion.div
                        className="feature-card"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="card-glare"></div>
                        <div className="feature-icon-wrapper">
                            <Database className="text-neon-purple" size={40} />
                        </div>
                        <h3 className="jp-text feature-title">Big Daddy ヒエラルキー</h3>
                        <p className="jp-text feature-text">
                            事務所のPC（親機）をデータの「真実」とし、現場の端末に対して一時的な権限を委託する。強固で堅牢な階層構造（ヒエラルキー）が、分散ネットワークの安全性を担保。
                        </p>
                    </motion.div>

                    {/* Feature 2 (Highlighted with IMG) */}
                    <motion.div
                        className="feature-card highlight-card"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="card-glare"></div>
                        <div className="feature-img-wrapper">
                            <img src="/swap_qr.png" alt="10-second swap QR Tech" className="feature-img" />
                            <div className="overlay-scanline"></div>
                        </div>
                        <div className="feature-icon-wrapper">
                            <RefreshCw className="text-alert" size={40} />
                        </div>
                        <h3 className="jp-text feature-title text-alert">10秒スワップ (権限委譲)</h3>
                        <p className="jp-text feature-text">
                            端末故障時でも運用を止めない。QRスキャン一つで別のスマートフォンを即座に「レジ」へと昇格させる、トカゲの尻尾切りのような驚異的な復元力（レジリエンス）。
                        </p>
                    </motion.div>

                    {/* Feature 3 */}
                    <motion.div
                        className="feature-card"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="card-glare"></div>
                        <div className="feature-icon-wrapper">
                            <Printer className="text-neon-blue" size={40} />
                        </div>
                        <h3 className="jp-text feature-title">CloudPRNT & PWA</h3>
                        <p className="jp-text feature-text">
                            ウェブブラウザの制約を突破。OSやデバイスを問わないシームレスな操作感と、ローカル同等以上の安定した印刷インフラを現場に提供。
                        </p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default Features;

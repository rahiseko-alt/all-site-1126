import { motion } from 'framer-motion';
import './Comparison.css';

const Comparison = () => {
    return (
        <section className="comparison-section">
            <div className="container">

                <div className="section-header">
                    <motion.h2
                        className="en-text text-neon-purple"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        VS_CONVENTIONAL
                    </motion.h2>
                    <motion.p
                        className="jp-text section-desc"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        組織的な安心に対する、技術的な自由の証明
                    </motion.p>
                </div>

                <motion.div
                    className="table-wrapper"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <table className="comparison-table">
                        <thead>
                            <tr>
                                <th className="jp-text">比較軸</th>
                                <th className="jp-text opacity-50">Airレジ / スマレジ等</th>
                                <th className="jp-text aiueo-col text-neon-blue">Aiueo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="jp-text">構造</td>
                                <td className="jp-text">中央集権・インフラ標準化</td>
                                <td className="jp-text aiueo-col font-bold">自律分散・現場レジリエンス</td>
                            </tr>
                            <tr>
                                <td className="jp-text">コスト</td>
                                <td className="jp-text">高額な月額 or 手数料モデル</td>
                                <td className="jp-text aiueo-col font-bold">月額 4,200円 (インフラ実費のみ)</td>
                            </tr>
                            <tr>
                                <td className="jp-text">復旧</td>
                                <td className="jp-text">サポート窓口への連絡 (数時間〜数日)</td>
                                <td className="jp-text aiueo-col font-bold">現場での端末スワップ (約10秒)</td>
                            </tr>
                            <tr>
                                <td className="jp-text">メリット</td>
                                <td className="jp-text">巨大組織による画一的な保証</td>
                                <td className="jp-text aiueo-col font-bold">AIパッチ & 外部API自在連携</td>
                            </tr>
                        </tbody>
                    </table>
                </motion.div>

            </div>
        </section>
    );
};

export default Comparison;

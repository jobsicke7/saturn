// components/FNB.tsx
import Link from 'next/link';
import styles from '../app/styles/FNB.module.css';

interface FooterSection {
    title: string;
    links: {
        label: string;
        href: string;
    }[];
}

interface SocialLink {
    name: string;
    href: string;
    icon: React.ReactNode;
}

interface FNBProps {
    sections: FooterSection[];
    copyright: string;
    socialLinks?: SocialLink[];
}

export default function FNB({ sections, copyright, socialLinks }: FNBProps) {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {sections.map((section, index) => (
                        <div key={index} className={styles.section}>
                            <h3 className={styles.sectionTitle}>
                                {section.title}
                            </h3>
                            <ul className={styles.linkList}>
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex} className={styles.linkItem}>
                                        <Link
                                            href={link.href}
                                            className={styles.link}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {socialLinks && (
                    <div className={styles.socialSection}>
                        <div className={styles.socialLinks}>
                            {socialLinks.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.href}
                                    className={styles.socialLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={item.name}
                                >
                                    {item.icon}
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.copyright}>
                    {copyright}
                </div>
            </div>
        </footer>
    );
}

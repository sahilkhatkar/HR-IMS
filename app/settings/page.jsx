'use client';

import { useTheme } from '../ThemeContext';
import CustomDropdown from '../components/CustomDropdown';
import styles from './settings.module.css';

export default function SettingsPage() {
    const { theme, setTheme, availableThemes } = useTheme();

    return (
        <div className={styles.container}>
            <div className={styles.section}>
                <label htmlFor="themeSelect">Choose Theme:</label>
                <select
                    id="themeSelect"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className={styles.select}
                >
                    {availableThemes.map((t) => (
                        <option key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            <div className={styles.previewCard}>
                <h3>Theme Preview</h3>
                <p>This is a preview of your selected theme.</p>
            </div>

        </div>
    );
}

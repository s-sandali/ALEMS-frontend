import type { SupportedLanguage } from "@/lib/api";

type Props = {
    languages: SupportedLanguage[];
    value: number;
    onChange: (languageId: number) => void;
    disabled?: boolean;
};

export default function LanguageSelector({ languages, value, onChange, disabled }: Props) {
    return (
        <select
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            disabled={disabled}
            style={{
                background: "var(--db-bg2)",
                border: "1px solid var(--db-border2)",
                borderRadius: 8,
                color: "var(--db-text)",
                fontSize: 13,
                padding: "6px 10px",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.5 : 1,
                outline: "none",
                fontFamily: "'Poppins', sans-serif",
            }}
        >
            {languages.map(lang => (
                <option key={lang.languageId} value={lang.languageId}>
                    {lang.name}
                </option>
            ))}
        </select>
    );
}

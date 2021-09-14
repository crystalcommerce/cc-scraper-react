import styles from "./EmptyCardFlex.module.scss";

export default function EmptyCardFlex({ children, style, className }) {
    return (
        <div className={`${styles["empty"]} ${className || ""}`}style={style}>
            {children}
        </div>
    )
}
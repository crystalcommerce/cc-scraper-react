// styles
import styles from "./Card.module.scss";

export default function Card({ children, className, style, width })  {
    return (
        <div className={`${styles.card} ${className}`} style={{...style, width}}>
            {children}
        </div>
    )
}
import EmptyCardFlex from "../../components/EmptyCardFlex";
import styles from "./Page404.module.scss";



export default function Page404()   {
    return (
        <EmptyCardFlex className={styles["page404-container"]}>
            <h2 className={styles["page404-error"]}>404 Error : Page not found</h2>
        </EmptyCardFlex>
    )
}
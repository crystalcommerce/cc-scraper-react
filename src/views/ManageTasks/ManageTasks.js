import EmptyCardFlex from "../../components/EmptyCardFlex";

import styles from "./ManageTasks.module.scss"


export default function ManageScrapedData({pageTitle}) {



    return (
        <>
            <h1 className="page-title">{pageTitle}</h1>
            <EmptyCardFlex className={styles["main-container"]}>
                <h2 className={styles["section-title"]}>Page Under Construction...</h2>
            </EmptyCardFlex>
        </>
    )
}
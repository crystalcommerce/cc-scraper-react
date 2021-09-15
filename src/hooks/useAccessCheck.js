import { useEffect } from "react";
import { useHistory } from "react-router";
import useAuth from "./useAuth";

export default function useAccessCheck(allowedPermissionLevel)  {
    let { loggedUser } = useAuth(),
        history = useHistory();
    

    useEffect(() => {

        if(loggedUser && loggedUser.permissionLevel < allowedPermissionLevel)   {
            history.go(-1);
        }

    }, [loggedUser]);
}
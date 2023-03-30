import {isRouteErrorResponse, useRouteError} from "react-router-dom";

export default function ErrorPage() {
    let error = useRouteError();
    console.log(error);

    if (isRouteErrorResponse(error)) {
        return <p>{error.status} {error.statusText}</p>
    }

    return <p>{"Unknown Error"}</p>
}
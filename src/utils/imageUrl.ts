
import {env} from "../configs/env.config";

    export const getEnvironmentImageUrl = () => {

    const data =
    env.NODE_ENV == 'development'
    ? `${env.DEVELOPMENT_URI}/uploads`
    : `${env.PRODUCTION_URI}/uploads`;

    return data;
    };

export const getEnvirontmentBaseUrl = () => {
return env.NODE_ENV == 'development'
? env.DEVELOPMENT_URI
: env.PRODUCTION_URI;
};

import { url_processor } from './url_processor'

export class UrlParse {

    url = "";

    constructor(url: string) {
        this.url = url;
    }

    getDomain(): string {
        return url_processor("hostname", this.url);
    }

    getTLD(): string {
        return url_processor("tld", this.url);
    }

    getRootDomain(): string {
        return url_processor("domain", this.url);
    }

    getSub(): string {
        return url_processor("sub", this.url);
    }

    getAuth(): string {
        return url_processor("auth", this.url);
    }

    getUser(): string {
        return url_processor("user", this.url);
    }

    getPass(): string {
        return url_processor("pass", this.url);
    }

    getPort(): string {
        return url_processor("port", this.url);
    }

    getProtocol(): string {
        return url_processor("protocol", this.url);
    }

    getPath(): string {
        return url_processor("path", this.url);
    }

    getQuery(): string {
        return url_processor("query", this.url);
    }

    getQueryCount(): number {
        if(url_processor("?", this.url)){
            return Object.keys(url_processor("?", this.url)).length;
        }else{
            return 0;
        }
    }

    getField(): Array<string> {
        return url_processor("field", this.url);
    }

}
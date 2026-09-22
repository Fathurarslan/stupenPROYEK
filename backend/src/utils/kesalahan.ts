// Dilempar saat input dari client tidak valid -> HTTP 400
export class KesalahanInput extends Error {
    constructor(pesan: string) {
        super(pesan);
        this.name = "KesalahanInput";
    }
}

// Dilempar saat token tidak ada / kedaluwarsa / salah -> HTTP 401
export class KesalahanAuth extends Error {
    constructor(pesan: string) {
        super(pesan);
        this.name = "KesalahanAuth";
    }
}

export class ListEnforcerStatus {
    id: number;
    name_en: string;
    name_ar: string;
    color: string;
    description: string;
    created_by: string;
    created_at: string;

    constructor(
        id: number,
        name_en: string,
        name_ar: string,
        color: string,
        description: string,
        created_by: string,
        created_at: string) {
        this.id = id;
        this.name_en = name_en;
        this.name_ar = name_ar;
        this.color = color;
        this.description = description;
        this.created_at = created_at;
    }
}

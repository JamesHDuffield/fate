export interface Option {
    text: string;
    id: string;
    editing?: boolean;
}

export interface Moment {
    text: string;
    options: Option[];
}

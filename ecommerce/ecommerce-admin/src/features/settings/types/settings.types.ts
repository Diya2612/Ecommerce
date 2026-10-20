// Settings feature types

export interface SettingsSection {
    id: string;
    title: string;
    description: string;
    icon: string;
    link: string;
    badge?: string;
    restricted?: boolean;
}

export interface SettingsGroup {
    id: string;
    title: string;
    sections: SettingsSection[];
}

export interface Role {
    id: string;
    name: string;
    type: string;
    permissions: string;
    users: number;
    createdBy: string;
    created_at?: string;
}

export interface Permission {
    id: string;
    module: string;
    action: string;
    description: string;
}

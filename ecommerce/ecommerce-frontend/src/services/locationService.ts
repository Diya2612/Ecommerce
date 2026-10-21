export interface State {
    name: string;
    state_code: string;
}

export interface City {
    name: string;
}

const API_BASE_URL = 'https://countriesnow.space/api/v0.1/countries';

/**
 * Fetch all states for India
 */
export async function getIndianStates(): Promise<State[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/states/q?country=India`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch states: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.msg);
        }

        return data.data.states || [];
    } catch (error) {
        console.error('Error fetching states:', error);
        return [];
    }
}

/**
 * Fetch all cities for a specific state in India
 */
export async function getCitiesByState(stateName: string): Promise<string[]> {
    try {
        const encodedState = encodeURIComponent(stateName);
        const response = await fetch(`${API_BASE_URL}/state/cities/q?country=India&state=${encodedState}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch cities: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.msg);
        }

        return data.data || [];
    } catch (error) {
        console.error(`Error fetching cities for ${stateName}:`, error);
        return [];
    }
}

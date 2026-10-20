
export interface State {
    name: string;
    state_code: string;
}

export interface City {
    name: string;
}

const API_BASE_URL = 'https://countriesnow.space/api/v0.1/countries';

// Map admin country codes (value) to API country names
const COUNTRY_NAME_MAP: Record<string, string> = {
    'india': 'India',
    'usa': 'United States',
    'uk': 'United Kingdom',
    'canada': 'Canada'
};

/**
 * Fetch all states for a specific country
 * @param countryCode The country code from the dropdown (e.g., 'india', 'usa')
 */
export async function getStates(countryCode: string): Promise<State[]> {
    try {
        const countryName = COUNTRY_NAME_MAP[countryCode.toLowerCase()];
        if (!countryName) return [];

        const response = await fetch(`${API_BASE_URL}/states/q?country=${encodeURIComponent(countryName)}`, {
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
 * Fetch all cities for a specific state in a country
 * @param countryCode The country code from the dropdown
 * @param stateName The name of the state
 */
export async function getCities(countryCode: string, stateName: string): Promise<string[]> {
    try {
        const countryName = COUNTRY_NAME_MAP[countryCode.toLowerCase()];
        if (!countryName || !stateName) return [];

        const encodedCountry = encodeURIComponent(countryName);
        const encodedState = encodeURIComponent(stateName);

        const response = await fetch(`${API_BASE_URL}/state/cities/q?country=${encodedCountry}&state=${encodedState}`, {
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
        console.error(`Error fetching cities for ${stateName}, ${countryCode}:`, error);
        return [];
    }
}

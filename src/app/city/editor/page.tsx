import { Metadata } from 'next';
import CityEditor from './CityEditor';

export const metadata: Metadata = {
    title: 'City Editor | Tomlin7',
    description: 'A level editor for the city simulation project.',
};

export default function Page() {
    return <CityEditor />;
}

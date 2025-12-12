import { Metadata } from 'next';
import CitySimulation from './CitySimulation';

export const metadata: Metadata = {
    title: 'City Simulation | Tomlin7',
    description: 'An interactive traffic simulation using a custom tile engine.',
};

export default function Page() {
    return <CitySimulation />;
}

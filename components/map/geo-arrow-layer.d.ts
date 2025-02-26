import { FC } from 'react';
import { Table } from 'apache-arrow';

interface HoverInfo {
  x: number;
  y: number;
  properties: {
    'County': string;
    'Date of Sale (dd/mm/yyyy)': string;
    'Description of Property': string;
    'Price (€)': number;
    'Property Size Description': string;
    'formatted_address': string;
  };
}

interface GeoArrowMapLayerProps {
  onHoverInfo: (info: HoverInfo | null) => void;
  onLoadingState: (loading: boolean) => void;
}

export const GeoArrowMapLayer: FC<GeoArrowMapLayerProps>; 
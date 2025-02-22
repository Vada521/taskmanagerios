import { ChartData, ChartOptions } from 'chart.js';

declare module 'chart.js' {
  interface ChartTypeRegistry {
    line: {
      chartOptions: ChartOptions<'line'>;
      datasetOptions: any;
      defaultDataPoint: number;
      metaExtensions: {};
      parsedDataType: any;
      scales: any;
    };
  }
}

declare module 'react-chartjs-2' {
  import { ChartProps } from 'react-chartjs-2';
  
  export interface LineProps {
    data: ChartData<'line'>;
    options?: ChartOptions<'line'>;
  }

  export class Line extends React.Component<LineProps> {}
} 
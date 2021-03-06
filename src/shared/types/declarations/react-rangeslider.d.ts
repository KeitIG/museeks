declare module 'react-rangeslider' {
  export interface SliderProps {
    min?: number;
    max?: number;
    step?: number;
    value: number;
    orientation?: string;
    reverse?: boolean;
    tooltip?: boolean;
    labels?: Record<string, string>;
    handleLabel?: boolean;
    format?: (value: string) => string;
    onChange?(value: number): void;
    onChangeStart?(value: number): void;
    onChangeComplete?(value: number): void;
    disabled?: boolean;
  }

  export default class Slider extends React.Component<SliderProps> {}
}

export interface AnalysisState {
  isLoading: boolean;
  result: string | null;
  error: string | null;
  mode: 'text' | 'image';
}

export interface GroundingMetadata {
  web?: {
    uri: string;
    title: string;
  };
}

// Helper type for the props of our components
export interface IconProps {
  className?: string;
}
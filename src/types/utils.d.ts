declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// K merge 到 T
declare type Merge<T, K> = { [P in Exclude<keyof T, keyof K>]: T[P] } & K;

// Infers prop type from component C
declare type GetProps<C> = C extends React.Component<infer P> ? P : never;

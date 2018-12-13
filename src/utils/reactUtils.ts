import { ComponentClass, FunctionComponent } from 'react';
// eslint-disable-next-line import/prefer-default-export
export const getComponentName = (c: ComponentClass | FunctionComponent): string => c.displayName || c.name || 'Component';

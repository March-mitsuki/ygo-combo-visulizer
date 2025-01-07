/* eslint-disable react-refresh/only-export-components */
import { Grid, GridItem, GridItemProps } from "@chakra-ui/react";

export type PositionProps = React.PropsWithChildren<{
  start: number;
  end: number;
}> &
  GridItemProps;
export const Position: React.FC<PositionProps> = ({
  children,
  start,
  end,
  ...rest
}) => {
  return (
    <GridItem colStart={start} colSpan={end - start + 1} {...rest}>
      {children}
    </GridItem>
  );
};

export type MainProps = React.PropsWithChildren<GridItemProps>;
export const Main: React.FC<MainProps> = ({ children, ...rest }) => {
  return (
    <Position start={5} end={20} {...rest}>
      {children}
    </Position>
  );
};

export type RootGridProps = React.PropsWithChildren;
export const RootGrid: React.FC<RootGridProps> = ({ children }) => {
  return (
    <Grid
      templateColumns="repeat(24, 1fr)"
      templateRows="auto 1fr"
      gap={0}
      columnGap={0}
    >
      {children}
    </Grid>
  );
};

export const calcGrid = (length: number) => {
  return `calc((100% / 24) * ${length})`;
};

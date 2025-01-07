import { ListParams, ListResponse, ModelHttpClient } from "./model_client";

export type PagenationState<T = any> = {
  listData: T[];
  next: string | null;
  isFetching: boolean;
  initialized: boolean;
  where?: Record<string, any>;
};

export type AddNextPayload<T = any> = {
  results: T[];
  next: string | null;
};
export type AddNextAction = (payload: AddNextPayload) => {
  type: "ADD_NEXT";
  payload: AddNextPayload;
};

export type SetIsFetchingAction = (isFetching: boolean) => {
  type: "SET_IS_FETCHING";
  payload: boolean;
};

export type DeleteRecordAction = (id: number) => {
  type: "DELETE_RECORD";
  payload: number;
};

export type SetWhereAction = (where: Record<string, any>) => {
  type: "SET_WHERE";
  payload: Record<string, any>;
};

export type SetDataAction = (data: AddNextPayload) => {
  type: "SET_DATA";
  payload: AddNextPayload;
};

const pagenationInitialSatate: PagenationState = {
  listData: [],
  next: null,
  isFetching: false,
  initialized: false,
};
export const pagenationActions: {
  addNext: AddNextAction;
  setIsFetching: SetIsFetchingAction;
  deleteRecord: DeleteRecordAction;
  setWhere: SetWhereAction;
  setData: SetDataAction;
} = {
  addNext: (payload) => ({
    type: "ADD_NEXT",
    payload,
  }),
  setIsFetching: (isFetching) => ({
    type: "SET_IS_FETCHING",
    payload: isFetching,
  }),
  deleteRecord: (id) => ({
    type: "DELETE_RECORD",
    payload: id,
  }),
  setWhere: (where) => ({
    type: "SET_WHERE",
    payload: where,
  }),
  setData: (data) => ({
    type: "SET_DATA",
    payload: data,
  }),
};
export type PagenationActions = ReturnType<
  | AddNextAction
  | SetIsFetchingAction
  | DeleteRecordAction
  | SetWhereAction
  | SetDataAction
>;

export const pagenationReducer = (
  state: PagenationState,
  action: PagenationActions,
): PagenationState => {
  switch (action.type) {
    case "ADD_NEXT":
      if (!state.initialized) {
        return {
          ...state,
          listData: action.payload.results,
          next: action.payload.next,
          initialized: true,
        };
      } else {
        return {
          ...state,
          listData: [...state.listData, ...action.payload.results],
          next: action.payload.next,
        };
      }
    case "SET_IS_FETCHING":
      return {
        ...state,
        isFetching: action.payload,
      };
    case "DELETE_RECORD":
      return {
        ...state,
        listData: state.listData.filter(
          (record) => record.id !== action.payload,
        ),
      };
    case "SET_WHERE":
      return {
        ...state,
        where: action.payload,
      };
    case "SET_DATA":
      return {
        ...state,
        listData: action.payload.results,
        next: action.payload.next,
      };
    default:
      return state;
  }
};
export const usePagenationClient = <T = any>(
  useReducer: any, // react useReducer hook
  client: ModelHttpClient<any>,
  where?: Record<string, any>,
) => {
  const [state, dispatch] = useReducer(pagenationReducer, {
    ...pagenationInitialSatate,
    where,
  });

  const loadNext = async () => {
    if (state.isFetching) return;

    try {
      dispatch(pagenationActions.setIsFetching(true));
      if (state.next === null) {
        const res = await client.list({ search: { where: state.where } });
        dispatch(
          pagenationActions.addNext({
            results: res.data.results,
            next: res.data.next,
          }),
        );
      } else {
        const res = (await client.do({
          method: "GET",
          path: state.next,
          query: { where: ModelHttpClient.objectToBase64UrlSafe(state.where) },
        })) as ListResponse<any>;
        dispatch(
          pagenationActions.addNext({
            results: res.data.results,
            next: res.data.next,
          }),
        );
      }
    } finally {
      dispatch(pagenationActions.setIsFetching(false));
    }
  };

  const deleteRecord = async (id: number) => {
    await client.destroy(id);
    dispatch(pagenationActions.deleteRecord(id));
  };

  const reload = async (where?: Record<string, any>) => {
    try {
      dispatch(pagenationActions.setIsFetching(true));
      const res = await client.list({
        search: { where: where ?? state.where },
      });
      dispatch(
        pagenationActions.setData({
          results: res.data.results,
          next: res.data.next,
        }),
      );
    } finally {
      dispatch(pagenationActions.setIsFetching(false));
    }
  };

  const changeSearch = (where: Record<string, any>) => {
    dispatch(pagenationActions.setWhere(where));
  };

  return {
    loadNext,
    reload,
    changeSearch,
    deleteRecord,
    isFetching: state.isFetching as PagenationState<T>["isFetching"],
    listData: state.listData as PagenationState<T>["listData"],
    hasNext: state.next !== null,
    initialized: state.initialized as PagenationState<T>["initialized"],
  };
};

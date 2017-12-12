import { ActionReducer, Action } from '@ngrx/store';
import _get from 'lodash/get';

import { INIT, CLEAN_CACHE } from '../actions';
import { IAPIError } from '../APIInterfaces';
import { getUniqueStoreKey } from '../utils/list';

export interface IListState {
    [key: string]: {
        error: boolean,
        submitting: boolean,
        currentPage: number;
        loadedPage: number;
        totalPages: number;
        totalItems: number;
        perPage: number;
        list: Array<number>
    }
}

export const types = {
    REQUEST: 'LIST/REQUEST',
    SUCCESS: 'LIST/SUCCESS',
    ERROR: 'LIST/ERROR',
    RESET_PAGE: 'LIST/RESET_PAGE',
    NEXT_PAGE: 'LIST/NEXT_PAGE',
}

export const actions = {
    request: (itemType, query, meta, reset = false, callback): Action => ({
        type: types.REQUEST,
        payload: { itemType, query, meta, reset, callback }
    }),
    success: (itemType, query, response, reset = false): Action => ({
        type: types.SUCCESS,
        payload: { itemType, reset, query, ...response }
    }),
    error: (itemType, query): Action => ({
        type: types.ERROR,
        payload: { itemType, query }
    }),
    nextPage: (itemType, query): Action => ({
        type: types.NEXT_PAGE,
        payload: { itemType, query }
    }),
    resetPage: (itemType, query): Action => ({
        type: types.RESET_PAGE,
        payload: { itemType, query }
    }),
};

const defaultItem = {
    error: false,
    submitting: false,
    loadedPage: 0,
    currentPage: 1,
    perPage: 0,
    totalPages: undefined,
    totalItems: undefined,
    list: []
};

const defaultState = {};

export const listReducer: ActionReducer<Object> = (state: IListState = defaultState, action: Action) => {
    const payload = action.payload;

    switch (action.type) {
        case types.REQUEST: {
            const { itemType, query, reset = false } = payload;
            const key = getUniqueStoreKey(itemType, query);

            return {
                ...state,
                [key]: {
                    ...(state[key] || defaultItem),
                    submitting: true,
                    currentPage: reset ? 1 : _get(state, `[${key}].currentPage`, 1),
                    loadedPage: reset ? 0 : _get(state, `[${key}].loadedPage`, 0),
                }
            }
        }

        case types.SUCCESS: {
            const { itemType, query, totalPages, totalItems, list = [], loadedPage = 0, reset = false } = payload;

            const ids = list.map((item) => item.id);
            const key = getUniqueStoreKey(itemType, query);
            if (state[key] && state[key].loadedPage === loadedPage) return state;

            return {
                ...state,
                [key]: {
                    ...(state[key] || defaultItem),
                    submitting: false,
                    error: false,
                    currentPage: state[key].currentPage + 1,
                    loadedPage,
                    totalPages,
                    perPage: query.per_page,
                    list: (reset || !state[key] ? defaultItem : state[key]).list.concat(ids)
                }
            };
        }

        case types.ERROR: {
            const { itemType, query } = payload;
            const key = getUniqueStoreKey(itemType, query);

            return {
                ...state,
                [key]: {
                    ...state[key],
                    submitting: false,
                    error: true,
                }
            }
        }

        case types.NEXT_PAGE: {
            const { itemType, query } = payload;
            const key = getUniqueStoreKey(itemType, query);
            const currentPage = state[key].currentPage;
            const totalPages = state[key].totalPages;

            if (currentPage >= totalPages) return state;

            return {
                ...state,
                [key]: { ...state[key], currentPage: currentPage + 1, }
            }

        }

        case types.RESET_PAGE: {
            const { itemType, query } = payload;
            const key = getUniqueStoreKey(itemType, query);

            return {
                ...state,
                [key]: !state[key] ? { ...defaultItem } : { ...state[key], currentPage: 1, }
            }

        }

        case INIT: {
            return payload.list || defaultState;
        }

        case CLEAN_CACHE: {
            return defaultState;
        }

        default:
            return state;
    }
}

/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { getOr } from 'lodash/fp';
import React from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { DEFAULT_INDEX_KEY } from '../../../common/constants';
import { KpiHostDetailsData, GetKpiHostDetailsQueryComponent } from '../../graphql/types';
import { inputsModel, inputsSelectors, State } from '../../store';
import { useUiSetting } from '../../lib/kibana';
import { createFilter, getDefaultFetchPolicy } from '../helpers';
import { QueryTemplateProps } from '../query_template';

const ID = 'kpiHostDetailsQuery';

export interface KpiHostDetailsArgs {
  id: string;
  inspect: inputsModel.InspectQuery;
  kpiHostDetails: KpiHostDetailsData;
  loading: boolean;
  refetch: inputsModel.Refetch;
}

export interface QueryKpiHostDetailsProps extends QueryTemplateProps {
  children: (args: KpiHostDetailsArgs) => React.ReactElement;
}

const KpiHostDetailsComponentQuery = React.memo<QueryKpiHostDetailsProps & PropsFromRedux>(
  ({ id = ID, children, endDate, filterQuery, isInspected, skip, sourceId, startDate }) => (
    <GetKpiHostDetailsQueryComponent
      fetchPolicy={getDefaultFetchPolicy()}
      notifyOnNetworkStatusChange
      skip={skip}
      variables={{
        sourceId,
        timerange: {
          interval: '12h',
          from: startDate!,
          to: endDate!,
        },
        filterQuery: createFilter(filterQuery),
        defaultIndex: useUiSetting<string[]>(DEFAULT_INDEX_KEY),
        inspect: isInspected,
      }}
    >
      {({ data, loading, refetch }) => {
        const kpiHostDetails = getOr({}, `source.KpiHostDetails`, data);
        return children({
          id,
          inspect: getOr(null, 'source.KpiHostDetails.inspect', data),
          kpiHostDetails,
          loading,
          refetch,
        });
      }}
    </GetKpiHostDetailsQueryComponent>
  )
);

KpiHostDetailsComponentQuery.displayName = 'KpiHostDetailsComponentQuery';

const makeMapStateToProps = () => {
  const getQuery = inputsSelectors.globalQueryByIdSelector();
  const mapStateToProps = (state: State, { id = ID }: QueryKpiHostDetailsProps) => {
    const { isInspected } = getQuery(state, id);
    return {
      isInspected,
    };
  };
  return mapStateToProps;
};

const connector = connect(makeMapStateToProps);

type PropsFromRedux = ConnectedProps<typeof connector>;

export const KpiHostDetailsQuery = connector(KpiHostDetailsComponentQuery);

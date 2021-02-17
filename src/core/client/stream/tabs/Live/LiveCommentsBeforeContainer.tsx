import React, { FunctionComponent, useCallback, useMemo } from "react";
import { graphql, RelayPaginationProp } from "react-relay";
import { FragmentRefs } from "relay-runtime";

import {
  useLoadMore,
  withPaginationContainer,
} from "coral-framework/lib/relay";

import { LiveCommentsBeforeContainer_story } from "coral-stream/__generated__/LiveCommentsBeforeContainer_story.graphql";
import { LiveCommentsBeforeContainerPaginationQueryVariables } from "coral-stream/__generated__/LiveCommentsBeforeContainerPaginationQuery.graphql";

interface RenderProps {
  beforeComments: {
    readonly " $fragmentRefs": FragmentRefs<"LiveChatContainerBeforeComment">;
  }[];
  beforeHasMore: () => boolean;
  loadMoreBefore: () => Promise<void>;
  isLoadingMoreBefore: boolean;
}

type RenderPropsCallback = (props: RenderProps) => React.ReactElement;

interface Props {
  story: LiveCommentsBeforeContainer_story;
  relay: RelayPaginationProp;
  cursor: string;
  children: RenderPropsCallback;
}

const LiveCommentsBeforeContainer: FunctionComponent<Props> = ({
  story,
  relay,
  children,
}) => {
  const [loadMore, isLoadingMore] = useLoadMore(relay, 20);

  const beforeComments = useMemo(() => {
    const before = story.before;
    const comments = before?.edges.map((e) => e.node) || [];

    return comments.slice().reverse();
  }, [story]);

  const hasMore = useCallback(() => {
    return relay.hasMore();
  }, [relay]);

  return children({
    beforeComments,
    beforeHasMore: hasMore,
    loadMoreBefore: loadMore,
    isLoadingMoreBefore: isLoadingMore,
  });
};

type FragmentVariables = Omit<
  LiveCommentsBeforeContainerPaginationQueryVariables,
  "storyID"
>;

const enhanced = withPaginationContainer<
  Props,
  LiveCommentsBeforeContainerPaginationQueryVariables,
  FragmentVariables
>(
  {
    story: graphql`
      fragment LiveCommentsBeforeContainer_story on Story
        @argumentDefinitions(
          count: { type: "Int", defaultValue: 5 }
          cursor: { type: "Cursor" }
        ) {
        id
        before: comments(
          flatten: true
          after: $cursor
          orderBy: CREATED_AT_DESC
          first: $count
          inclusive: true
        ) @connection(key: "Chat_before", filters: ["orderBy"]) {
          edges {
            cursor
            node {
              ...LiveChatContainerBeforeComment
            }
          }
          pageInfo {
            endCursor
            hasNextPage
          }
        }
        ...AfterCommentsContainer_story @arguments(cursor: $cursor)
        ...LivePostCommentFormContainer_story
      }
    `,
  },
  {
    getConnectionFromProps({ story }) {
      return story && story.before;
    },
    getVariables(
      { story, cursor },
      { count, cursor: paginationCursor = cursor },
      fragmentVariables
    ) {
      return {
        count,
        cursor: paginationCursor,
        includeBefore: true,
        includeAfter: true,
        storyID: story.id,
        flattenReplies: true,
      };
    },
    query: graphql`
      query LiveCommentsBeforeContainerPaginationQuery(
        $count: Int!
        $cursor: Cursor
        $storyID: ID
      ) {
        story(id: $storyID) {
          ...LiveCommentsBeforeContainer_story
            @arguments(count: $count, cursor: $cursor)
        }
      }
    `,
  }
)(LiveCommentsBeforeContainer);

export default enhanced;

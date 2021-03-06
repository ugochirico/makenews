import AjaxClient from "./../../utils/AjaxClient";
import { newsBoardTabSwitch, paginatedFeeds } from "./DisplayFeedActions";
import { newsBoardSourceTypes } from "../../utils/Constants";
import Toast from "./../../utils/custom_templates/Toast";
import Locale from "./../../utils/Locale";

export const UPDATE_BOOKMARK_STATUS = "UPDATE_BOOKMARK_STATUS";
export const WEB_ARTICLE_RECEIVED = "WEB_ARTICLE_RECEIVED";
export const WEB_ARTICLE_REQUESTED = "WEB_ARTICLE_REQUESTED";
export const ADD_ARTICLE_TO_COLLECTION = "ADD_ARTICLE_TO_COLLECTION";
export const UNBOOKMARK_THE_ARTICLE = "UNBOOKMARK_THE_ARTICLE";

export const updateBookmarkStatus = (articleId, bookmarkStatus) => ({
    "type": UPDATE_BOOKMARK_STATUS,
    articleId,
    bookmarkStatus
});

export const unbookmarkArticle = (articleId) => ({
    "type": UNBOOKMARK_THE_ARTICLE,
    articleId
});

export function bookmarkArticle(article, currentTab) {
    const ajaxClient = AjaxClient.instance("/bookmarks");
    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    };

    return async dispatch => {
        const response = await ajaxClient.post(headers, {
            "docId": article._id
        });

        if(response.ok) {
            if(!article.bookmark) {
                const newBoardStrings = Locale.applicationStrings().messages.newsBoard;
                Toast.show(newBoardStrings.bookmarkSuccess, "bookmark");
            }
            dispatch(currentTab === newsBoardSourceTypes.bookmark
                ? unbookmarkArticle(article._id)
                : updateBookmarkStatus(article._id, !article.bookmark)
            );
        }
    };
}

export function displayWebArticle(feed) {
    const ajaxClient = AjaxClient.instance("/article");

    return async dispatch => {
        dispatch(webArticleRequested());
        try {
            const article = await ajaxClient.get({ "url": feed.link });
            dispatch(articleReceived(article.markup, true));
        } catch (err) {
            const articleStrings = Locale.applicationStrings().messages.newsBoard.article;
            Toast.show(articleStrings.fetchingArticleFailure);
            dispatch(articleReceived(feed.description));
        }
    };
}

function webArticleRequested() {
    return {
        "type": WEB_ARTICLE_REQUESTED
    };
}

export function articleReceived(article, isHTML = false) {
    return {
        "type": WEB_ARTICLE_RECEIVED,
        article,
        isHTML
    };
}

export function addToCollection(collection, article, isNewCollection = false) {
    return async dispatch => {
        const ajaxClient = AjaxClient.instance("/collection");
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        };
        const collectionStrings = Locale.applicationStrings().messages.newsBoard.collection.addToCollectionMessages;
        try {
            const response = await ajaxClient.put(headers, {
                "collection": collection,
                "docId": article.id,
                "isNewCollection": isNewCollection,
                "sourceId": article.sourceId,
                "selectedTextDoc": article.selectedTextDoc
            });
            if (response.ok === true && article.id) {
                Toast.show(`${collectionStrings.addFeedToCollectionSuccess}'${collection}'`, "collection");
                dispatch(newsBoardTabSwitch(article.sourceType));
            } else if (response.ok === true) {
                dispatch(paginatedFeeds([{ "collection": collection, "_id": response._id }]));
                Toast.show(collectionStrings.createCollectionSuccess, "success");
            } else if (response.message) {
                dispatch(newsBoardTabSwitch(article.sourceType || newsBoardSourceTypes.collection));
                Toast.show(response.message);
            } else {
                Toast.show(isNewCollection ? collectionStrings.createCollectionFailure : collectionStrings.addFeedToCollectionFailure);
            }
        } catch (err) {
            Toast.show(isNewCollection ? collectionStrings.createCollectionFailure : collectionStrings.addFeedToCollectionFailure);
        }
        dispatch(addArticleToCollection("", "", "", {}));
    };
}

export function addArticleToCollection(articleId, sourceType, sourceId, selectedTextDoc = {}) {
    return {
        "type": ADD_ARTICLE_TO_COLLECTION,
        "addArticleToCollection": { "id": articleId, sourceType, sourceId, selectedTextDoc }
    };
}

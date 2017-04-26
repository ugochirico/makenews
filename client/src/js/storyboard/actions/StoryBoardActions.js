import AjaxClient from "../../utils/AjaxClient";
import Toast from "../../utils/custom_templates/Toast";
import Locale from "./../../utils/Locale";

export const ADD_STORY_TITLE = "Story title";
export const REMOVE_STORY = "REMOVE_STORY";
export const CLEAR_STORIES = "CLEAR_STORIES";

export const clearStories = {
    "type": CLEAR_STORIES
};

export function setStoryTitle(story) {
    return {
        "type": ADD_STORY_TITLE,
        story
    };
}

export function removeStory(id) {
    return {
        "type": REMOVE_STORY,
        id
    };
}

export function deleteStory(id) {
    return (dispatch) => {
        const headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        };
        AjaxClient.instance("/delete-story").post(headers, { id }).then(() => {
            dispatch(removeStory(id));
            const storyBoard = Locale.applicationStrings().messages.storyBoard;
            Toast.show(storyBoard.successMessages.deleteStory, "success");
        });
    };
}

export function getStories() {
    return (dispatch) => {
        let ajax = AjaxClient.instance("/stories");

        ajax.get().then((response) => {
            response.docs.map((doc) => {
                dispatch(setStoryTitle(doc));
            });
        });
    };
}

import { API_KEY } from "./API";

const YTMAXRECORDS = 50;
const YTSORTBY = "title";
const YTTYPE = "video"
export const YTPAGE = "&pageToken=";
export const YTURL = `https://youtube.googleapis.com/youtube/v3/search?&part=snippet&order=${YTSORTBY}&type=${YTTYPE}&key=${API_KEY}&maxResults=${YTMAXRECORDS}&q=`;


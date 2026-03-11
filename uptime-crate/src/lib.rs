use std::sync::{ Mutex, LazyLock };
use reqwest;
use serde::{Serialize, Deserialize};
use wasm_bindgen::{ JsValue, prelude::wasm_bindgen };

#[derive(Serialize, Deserialize, Clone)]
pub struct Tracker {
    pub url: String,
    pub history: Vec<bool>,
}
static IP_LIST: LazyLock<Mutex<Vec<Tracker>>> = LazyLock::new(|| {
    Mutex::new(Vec::new())
});


#[wasm_bindgen]
pub fn get_trackers() -> JsValue {
    let list = IP_LIST.lock().unwrap();
    serde_wasm_bindgen::to_value(&*list).unwrap()
}


#[wasm_bindgen]
pub async fn check_all_ips() {
    let mut list = IP_LIST.lock().unwrap();

    for item in list.iter_mut() {
        let is_online = ping_like_fetch(&item.url).await;
        item.history.push(is_online);
    }
}

#[wasm_bindgen]
pub fn add_ip(url: String) -> bool {
    let mut list = IP_LIST.lock().unwrap();
    let url_list: Vec<_> = list.iter().map(|item| item.url.clone()).collect();

    if !url_list.contains(&url) {
        list.push(Tracker {url, history: vec![]});
        true
    }else {
        false
    }
}

#[wasm_bindgen]
pub fn remove_ip(name: String) -> bool {
    let mut list = IP_LIST.lock().unwrap();
    let size_pre = list.len();
    list.retain(|tracker| tracker.url != name);

    if list.len() != size_pre {
        true
    } else {
        false
    }
}

async fn ping_like_fetch(url: &str) -> bool {
    // just check if the server responds.
    let client = reqwest::Client::new();
    let res = client.get(url).send().await;

    match res {
        Ok(_) => true,
        Err(_) => false,
    }
}

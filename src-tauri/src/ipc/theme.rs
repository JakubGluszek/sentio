//! Tauri IPC commands to bridge the Theme Backend Model Controller with Client side.

use crate::model::{ModelDeleteResultData, ThemeBmc, ThemeForCreate, ThemeForUpdate};
use crate::prelude::{Error, Result};
use crate::{ctx::Ctx, model::Theme};
use tauri::{command, AppHandle, Wry};

#[command]
pub async fn get_theme(app: AppHandle<Wry>, id: String) -> Result<Theme> {
    match Ctx::from_app(app) {
        Ok(ctx) => match ThemeBmc::get(ctx, &id).await {
            Ok(theme) => Ok(theme),
            Err(err) => Err(err).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn get_themes(app: AppHandle<Wry>) -> Result<Vec<Theme>> {
    match Ctx::from_app(app) {
        Ok(ctx) => match ThemeBmc::list(ctx).await {
            Ok(themes) => Ok(themes),
            Err(err) => Err(err).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn create_theme(app: AppHandle<Wry>, data: ThemeForCreate) -> Result<Theme> {
    match Ctx::from_app(app) {
        Ok(ctx) => match ThemeBmc::create(ctx, data).await {
            Ok(theme) => Ok(theme),
            Err(err) => Err(err).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn update_theme(app: AppHandle<Wry>, id: String, data: ThemeForUpdate) -> Result<Theme> {
    match Ctx::from_app(app) {
        Ok(ctx) => match ThemeBmc::update(ctx, &id, data).await {
            Ok(theme) => Ok(theme),
            Err(err) => Err(err).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn delete_theme(app: AppHandle<Wry>, id: String) -> Result<ModelDeleteResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => match ThemeBmc::delete(ctx, &id).await {
            Ok(data) => Ok(data),
            Err(err) => Err(err).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

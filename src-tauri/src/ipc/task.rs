use tauri::{command, AppHandle, Wry};

use crate::{
    ctx::Ctx,
    model::{ModelDeleteResultData, Task, TaskBmc, TaskForCreate, TaskForUpdate},
    prelude::{Error, Result},
};

#[command]
pub async fn create_task(app: AppHandle<Wry>, data: TaskForCreate) -> Result<Task> {
    match Ctx::from_app(app) {
        Ok(ctx) => match TaskBmc::create(ctx, data).await {
            Ok(task) => Ok(task),
            Err(err) => Err(err).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn update_task(app: AppHandle<Wry>, id: String, data: TaskForUpdate) -> Result<Task> {
    match Ctx::from_app(app) {
        Ok(ctx) => match TaskBmc::update(ctx, &id, data).await {
            Ok(task) => Ok(task),
            Err(err) => Err(err).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn delete_task(app: AppHandle<Wry>, id: String) -> Result<ModelDeleteResultData> {
    match Ctx::from_app(app) {
        Ok(ctx) => match TaskBmc::delete(ctx, &id).await {
            Ok(data) => Ok(data),
            Err(err) => Err(err).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

#[command]
pub async fn get_tasks(app: AppHandle<Wry>) -> Result<Vec<Task>> {
    match Ctx::from_app(app) {
        Ok(ctx) => match TaskBmc::get_multi(ctx).await {
            Ok(tasks) => Ok(tasks),
            Err(err) => Err(err).into(),
        },
        Err(_) => Err(Error::CtxFail).into(),
    }
}

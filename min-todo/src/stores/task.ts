import {defineStore} from "pinia";
import {ITaskInfo, ITaskInfo as TaskInfo} from "../interfaces";
import {nanoid} from "nanoid";
import {configStore,listStore} from "../store";
// @ts-ignore
import _ from 'lodash-es'
import {sortType} from "../consts";

export const taskStore = defineStore('task', {
    state: () => {
        return {
            tasks: [] as TaskInfo[],
            currentTasks: [] as TaskInfo[],
            activeTask: <TaskInfo>{}
        }
    },
    getters: {
        displayList: (state) => {
            //显示
            let displayArray = state.tasks
            if (!configStore().config.showComplete) {
                displayArray = displayArray.filter(item => !item.completed)
            }
            if(listStore().activeList===null || typeof listStore().activeList==='undefined'){
                //不做处理
            }else if(listStore().activeList.nanoid){
                displayArray = displayArray.filter(item =>{
                    if(item.listNanoid){
                        return item.listNanoid.indexOf(listStore().activeList.nanoid)>-1
                    }else{
                        return false
                    }})//todo
            }
            if (configStore().config.sort.value === sortType.TIME.value) {
                displayArray = displayArray.sort((a, b) =>
                {
                    return (a.deadTime||-10) - (b.deadTime||-10)
                })
            }else if(configStore().config.sort.value === sortType.TITLE.value){
                displayArray = displayArray.sort((a,b)=>{
                   return (a.title>b.title?1:-1)
                })
            }else if(configStore().config.sort.value === sortType.LIST.value){
                displayArray = displayArray.sort((a,b)=>{
                    return ((a.listNanoid||0)>(b.listNanoid||0)?1:-1)
                })
            }
            return displayArray
        }
    },
    actions: {
        add(item: TaskInfo) {
            if (item.title.trim() === '') {
                return false
            }
            let newTask = _.cloneDeep(Object.assign(item, {
                nanoid: nanoid(6),
                createTime: Date.now(),
                description: '',
                descriptionType: 'text'
            }))
            this.tasks.push(newTask)
        },
        setActiveTask(task: TaskInfo) {
            this.activeTask = task
            console.log(task)
        },
        removeTask(nanoid: string) {
            if (this.activeTask.nanoid === nanoid) {
                this.activeTask = {}
            }
            this.tasks.splice(this.tasks.findIndex(task => task.nanoid === nanoid), 1)
        }
    }

})

import appEnv from '../../env.json'
import axios, {AxiosRequestConfig} from 'axios'
import { Network } from '@capacitor/network'
import AlertHook from '../alertsHook/AlertHook'

export default function useServicesApiHook() {
    const questionBox = AlertHook().QuestionBox()
    return {
      axiosRequest: (
        requestType: ('get'|'post'|'put'|'patch'|'delete'),
        attempts: number,
        route: string,
        data: any = undefined,
        options: AxiosRequestConfig = {}
      ) => {
        return new Promise((resolve, reject) => {
            try {
                if(attempts <= 0) {
                    throw new Error('set a number of attempts greater than zero')
                }else {
                    const requestApi = async (attemptsNumber: number = 1) => {
                        Network.getStatus().then(
                            async (networkResult: any) => {
                                if(networkResult.connected) {
                                    if(requestType == 'get' || requestType == 'delete') {
                                        await axios[requestType](route, options).then(
                                            (result) => {
                                                resolve(result.data)
                                            }
                                        ).catch(
                                            (error: any) => {
                                                if(attemptsNumber < attempts) {
                                                    requestApi(++attemptsNumber)
                                                }else {
                                                    reject(error)
                                                }
                                            }
                                        )
                                    }else {
                                        await axios[requestType](route, data, options).then(
                                            (result) => {
                                                resolve(result.data)
                                            }
                                        ).catch(
                                            (error) => {
                                                if(attemptsNumber < attempts) {
                                                    requestApi(++attemptsNumber)
                                                }else {
                                                    reject(error)
                                                }
                                            }
                                        )
                                    }
                                }else{
                                    await questionBox.openModal(
                                        'Sem conexão com a internet',
                                        'Se deseja continuar, busque acesso a internet e clique em continuar',
                                        [
                                            {text: 'Cancelar', role: 'cancel'},
                                            {text: 'Continuar', role: 'continue'},
                                        ]
                                    ).then(
                                        (questionResult: any) => {
                                            if(questionResult == 'continue') {
                                                requestApi()
                                            }else{
                                                reject(new Error('Requisição cancelada'))
                                            }
                                        }
                                    )
                                }
                            }
                        )
                    }

                    requestApi()
                }
            }catch(error) {
                reject(error)
            }
        })
      }
    }
  }
import {ReactNode} from 'react'
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonProgressBar,
  IonCardSubtitle,
  IonSpinner,
  useIonModal,
  IonAlert,
  IonButtons,
  IonButton,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonInput
} from '@ionic/react';

import './AlertHook.css';
import { useEffect, useState } from 'react';
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';

export default function useAlertHook() {
  function percentLoader() {
    const [closeAlert, setCloseAlert] = useState<boolean>(false)
    const [title, setTitle] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const [percent, setPercent] = useState<number>(0)
  
    const updateText = (title: string, message: string) => {
      setTitle(title)
      setMessage(message)
    }
  
    const updateAlert = (value:number) => {
      setPercent(value)
    }
    
    const dismissAlert = () => {
      setCloseAlert(true)
    }
  
    const ModalContainer = (
      {
        onDismiss,
      }: {
        onDismiss: (data?: string | null | undefined | number, role?: string) => void;
      }
    ) => {
      setCloseAlert(false)
      
      useEffect(() => {
        if(closeAlert == true) {
          onDismiss(null, 'confirm')
        }
      }, [closeAlert])
  
      return (
        <IonCard id="load-modal">
          <IonCardHeader>
            <IonCardTitle>{title}</IonCardTitle>
            <IonCardSubtitle>
              <IonSpinner name="crescent" color="primary"></IonSpinner>
            </IonCardSubtitle>
            <IonCardSubtitle>
              {Math.floor(percent*100)} %
            </IonCardSubtitle>
            <IonCardSubtitle>
              <IonProgressBar value={percent}></IonProgressBar>
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            {message}
          </IonCardContent>
        </IonCard>
      );
    };

    const [present, dismiss] = useIonModal(ModalContainer, {
      onDismiss: (data: string, role: string) => dismiss(data, role),
    });

    const openModal = (title: string, message: string) => {
      updateAlert(0)
      updateText(title, message)
      present({
        cssClass:'alertHook',
        canDismiss: async (data, role) => {
          return role == 'confirm'
        },
        onDidDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
          if (ev.detail.role === 'confirm') {
            //alert('fechou')
          }
        },
      });
    }
  
    return {
      openModal: openModal,
      updateText: updateText,
      updateAlert: updateAlert,
      dismissAlert: dismissAlert,
    }
  }
  
  function staticLoader() {
    const [closeAlert, setCloseAlert] = useState<boolean>(false)
    const [title, setTitle] = useState<string>('')
    const [message, setMessage] = useState<string>('')
  
    const updateText = (title: string, message: string) => {
      setTitle(title)
      setMessage(message)
    }
    
    const dismissAlert = () => {
      setCloseAlert(true)
    }
  
    const ModalContainer = (
      {
        onDismiss,
      }: {
        onDismiss: (data?: string | null | undefined | number, role?: string) => void;
      }
    ) => {
      setCloseAlert(false)
      
      useEffect(() => {
        if(closeAlert == true) {
          onDismiss(null, 'confirm')
        }
      }, [closeAlert])
  
      return (
        <IonCard id="load-modal">
          <IonCardHeader>
            <IonCardTitle>{title}</IonCardTitle>
            <IonCardSubtitle>
              <IonSpinner name="crescent" color="primary"></IonSpinner>
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            {message}
          </IonCardContent>
        </IonCard>
      );
    };

    const [present, dismiss] = useIonModal(ModalContainer, {
      onDismiss: (data: string, role: string) => dismiss(data, role),
    });

    const openModal = (title: string, message: string) => {
      return new Promise((resolve,reject) =>{
        updateText(title, message)
        present({
          onDidPresent: (ev) => {resolve('')},
          cssClass:'alertHook',
          canDismiss: async (data, role) => {
            return role == 'confirm'
          },
          onDidDismiss: (ev: CustomEvent<OverlayEventDetail>) => {},
        });
        
      })
    }
  
    return {
      openModal: openModal,
      updateText: updateText,
      dismissAlert: dismissAlert,
    }
  }

  function alertConfirm() {
    const [closeAlert, setCloseAlert] = useState<boolean>(false)
    const [title, setTitle] = useState<string>('')
    const [message, setMessage] = useState<string|ReactNode>('')

    const updateText = (title: string, message: string | ReactNode) => {
      setTitle(title)
      setMessage(message)
    }

    const ModalContainer = (
      {
        onDismiss,
      }: {
        onDismiss: (data?: string | null | undefined | number, role?: string) => void;
      }
    ) => {

      useEffect(() => {
        if(closeAlert == true) {
          onDismiss(null, 'confirm')
        }
      }, [closeAlert])
  
      return (
        <IonCard id="load-modal">
          <IonCardHeader>
            <IonCardTitle>{title}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {message}
          </IonCardContent>
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonButton expand='block' onClick={(e) => {onDismiss(null, 'confirm')}}>
                  OK
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
      )
    };

    const [present, dismiss] = useIonModal(ModalContainer, {
      onDismiss: (data: string, role: string) => dismiss(data, role),
    });

    const openModal = (
      title: string,
      message: string | ReactNode
    ) => {
      return new Promise((resolve, reject) => {
        setCloseAlert(false)
        updateText(title, message)
        present({
          cssClass:'alertHook',
          canDismiss: async (data, role) => {
            return role == 'confirm'
          },
          onDidDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
            resolve('')
          },
        });
      })
    }
  
    return {
      openModal: openModal,
      updateText: updateText,
    }
  }

  function alertTimer() {
    const [closeAlert, setCloseAlert] = useState<boolean>(false)
    const [title, setTitle] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const [percent, setPercent] = useState<number>(0)
  
    const updateText = (title: string, message: string) => {
      setTitle(title)
      setMessage(message)
    }
    
    const dismissAlert = () => {
      setCloseAlert(true)
    }

    const ModalContainer = (
      {
        onDismiss,
      }: {
        onDismiss: (data?: string | null | undefined | number, role?: string) => void;
      }
    ) => {
      setCloseAlert(false)

      useEffect(() => {
        if(closeAlert == true) {
          onDismiss(null, 'confirm')
        }
      }, [closeAlert])
  
      return (
        <IonCard id="load-modal">
          <IonCardHeader>
            <IonCardTitle>{title}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {message}
          </IonCardContent>
          <IonProgressBar value={percent}></IonProgressBar>
        </IonCard>
      );
    };

    const [present, dismiss] = useIonModal(ModalContainer, {
      onDismiss: (data: string, role: string) => dismiss(data, role),
    });

    const openModal = (title: string, message: string, timeout: number) => {
      return new Promise((resolve, reject) => {
        updateText(title, message)
        present({
          cssClass:'alertHook',
          canDismiss: async (data, role) => {
            return role == 'confirm'
          },
          onDidDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
            resolve('')
          },
        });
        let counter = 0
        const interval = setInterval(() => {
          counter += 50
          setPercent((counter/timeout));
          if(counter >= timeout) {
            clearInterval(interval);
            dismissAlert()
          }
        }, 50);
      })
    }
  
    return {
      openModal: openModal,
      updateText: updateText,
    }
  }
  
  function questionBox() {
    const [closeAlert, setCloseAlert] = useState<boolean>(false)
    const [title, setTitle] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const [buttonList, setButtonList] = useState<{text: string, role: string}[]>([])
  
    const updateText = (title: string, message: string) => {
      setTitle(title)
      setMessage(message)
    }
    const updateButtons = (buttons: {text: string, role: string}[]) => {
      setButtonList(buttons)
    }
    
    const dismissAlert = () => {
      setCloseAlert(true)
    }

    const ModalContainer = (
      {
        onDismiss,
      }: {
        onDismiss: (data?: string | null | undefined | number, role?: string) => void;
      }
    ) => {
      setCloseAlert(false)
      
      useEffect(() => {
        if(closeAlert == true) {
          onDismiss(null, 'confirm')
        }
      }, [closeAlert])
  
      return (
      <IonCard id="load-modal">
          <IonCardHeader>
            <IonCardTitle>{title}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {message}
          </IonCardContent>
          <IonGrid>
            <IonRow>
              {buttonList.map((btn, index) => (
                <IonCol key={index}>
                  <IonButton expand='block' onClick={(e) => {onDismiss(null, btn.role)}}>
                    {btn.text}
                  </IonButton>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </IonCard>
      );
    };

    const [present, dismiss] = useIonModal(ModalContainer, {
      onDismiss: (data: string, role: string) => dismiss(data, role),
    });

    
    const openModal = (title: string, message: string, buttonList: {text: string, role: string}[]) => {
      return new Promise((resolve, reject) => {
        updateText(title, message)
        updateButtons(buttonList)
        present({
          cssClass:'alertHook',
          canDismiss: async (data, role) => {
            return role != 'backdrop'
          },
          onDidDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
            resolve(ev.detail.role)
          },
        });
      })
    }
  
    return {
      openModal: openModal,
      updateText: updateText,
    }
  }

  function formBox() {
    const [closeAlert, setCloseAlert] = useState<boolean>(false)
    const [title, setTitle] = useState<string>('')
    const [message, setMessage] = useState<string>('')
    const [inputList, setInputList] = useState<{field: string, type: ('string'|'number'|'boolean'), label: string, value: any}[]>([])
  
    const updateText = (title: string, message: string) => {
      setTitle(title)
      setMessage(message)
    }
    const updateInputs = (inputs: {field: string, type: ('string'|'number'|'boolean'), label: string, value: any}[]) => {
      setInputList(inputs)
    }
    
    const dismissAlert = () => {
      setCloseAlert(true)
    }

    const ModalContainer = (
      {
        onDismiss,
      }: {
        onDismiss: (data?: any, role?: string) => void;
      }
    ) => {
      setCloseAlert(false)

      const buildJson = () => {
        let inputJsonList: any = {}
        inputList.forEach(input => {
          inputJsonList[input.field] = input.value
        })
        return inputJsonList
      }
      
      useEffect(() => {
        if(closeAlert == true) {
          onDismiss(null, 'confirm')
        }
      }, [closeAlert])
  
      return (
      <IonCard id="load-modal">
          <IonCardHeader>
            <IonCardTitle>{title}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {message}
          </IonCardContent>
          <IonGrid>
            {inputList.map((input, index) => (
              <IonRow key={index}>
                  <IonCol >
                    <IonInput
                      label={input.label}
                      label-placement="floating"
                      fill="solid"
                      type='text'
                      value={input.value}
                      spellcheck={true}
                      onIonInput={(e: any)=> {
                        let ilr = inputList
                        ilr[index].value = e.target.value
                        setInputList(ilr)
                      }}
                    />
                  </IonCol>
              </IonRow>
            ))}
            <IonRow>
              <IonCol>
                <IonButton expand='block' onClick={(e) => {onDismiss(null, 'cancel')}}>Cancelar</IonButton>
              </IonCol>
              <IonCol>
                <IonButton expand='block' onClick={(e) => {onDismiss(buildJson(), 'confirm')}}>Confirmar</IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCard>
      );
    };

    const [present, dismiss] = useIonModal(ModalContainer, {
      onDismiss: (data: string, role: string) => dismiss(data, role),
    });

    
    const openModal = (title: string, message: string, inputList: {field: string, type: ('string'|'number'|'boolean'), label: string, value: any}[]) => {
      return new Promise((resolve, reject) => {
        updateText(title, message)
        updateInputs(inputList)
        present({
          cssClass:'alertHook',
          canDismiss: async (data, role) => {
            return role != 'backdrop'
          },
          onDidDismiss: (ev: CustomEvent<OverlayEventDetail>) => {
            resolve(ev.detail)
          },
        });
      })
    }
  
    return {
      openModal: openModal,
      updateText: updateText,
    }
  }

  return {
    PercentLoader: percentLoader,
    StaticLoader: staticLoader,
    AlertConfirm: alertConfirm,
    AlertTimer: alertTimer,
    QuestionBox: questionBox,
    FormBox: formBox
  }
}
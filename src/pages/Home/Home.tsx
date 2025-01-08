import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
  IonItem,
  IonLabel,
  IonFooter,
} from '@ionic/react';

import appEnv from '../../env.json'

import './Home.css';

import useServicesDbHook from '../../services/database/servicesDbHook';
import { useEffect, useState } from 'react';

import translation from './translate.json'
import { Device } from '@capacitor/device'

import useServicesApiHook from '../../services/servicesApi/servicesApiHook'

const Home: React.FC = () => {
  const [language, setLanguage] = useState<string>('pt')
  const {initialized, getDb} = useServicesDbHook()
  const navigation = useIonRouter()
  const {axiosRequest} = useServicesApiHook()

  useEffect(() => {
    Device.getLanguageTag().then(
      (languageTag: any) => {
        setLanguage(languageTag.value.slice(0,2))
      }
    ).finally(() => {
      if(initialized) {
      }
    })
  }, [initialized])

  return (
    <>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>LinkBox</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen id="main-content-home">
          <IonHeader collapse="condense">
          </IonHeader>
        </IonContent>
        <IonFooter>
          <IonToolbar>
            <IonItem>
              <IonLabel>
                <h2>{(translation as any)[language].html.footer.version} {appEnv.APP_VERSION}</h2>
              </IonLabel>
            </IonItem>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    </>
  );
};

export default Home;

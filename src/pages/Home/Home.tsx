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
  IonList,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonCardTitle,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonFab,
  IonFabButton,
  IonSearchbar,
} from '@ionic/react';

import {
  addOutline,
  clipboardOutline,
  createOutline,
  linkOutline,
  shareSocialOutline
} from 'ionicons/icons'

import appEnv from '../../env.json'

import './Home.css';

import useServicesDbHook from '../../services/database/servicesDbHook';
import { useEffect, useState } from 'react';

import translation from './translate.json'
import { Device } from '@capacitor/device'

import useServicesApiHook from '../../services/servicesApi/servicesApiHook'
import AlertHook from '../../services/alertsHook/AlertHook'

import { Clipboard } from '@capacitor/clipboard'
import { Share } from '@capacitor/share'
import { Browser } from '@capacitor/browser'

const Home: React.FC = () => {
  const [language, setLanguage] = useState<string>('pt')
  const {initialized, getDb, insertDb, updateDb} = useServicesDbHook()
  const {axiosRequest} = useServicesApiHook()

  const [searchText, setSearchText] = useState<string>('')
  const [cardLinkList, setCardLinkList] = useState<any[]>([])
  const [stopInfiniteScroll, setStopInfiniteScroll] = useState<boolean>(false)

  //teste
  const questionBox = AlertHook().QuestionBox()
  const formBox = AlertHook().FormBox()
  const percentLoader = AlertHook().PercentLoader()
  const staticLoader = AlertHook().StaticLoader()
  const alertConfirm = AlertHook().AlertConfirm()
  const alertTimer = AlertHook().AlertTimer()

  const infiniteScrollLoad = async (renewList: boolean = false, titleSearch = '') => {
    await setStopInfiniteScroll(false)
    if(renewList) {
      await setSearchText(titleSearch)
      await setCardLinkList([])
    }
    await getDb({
      table: 'linksCard',
      order: {field: 'title', type: '-'},
      filter: [{field:'title', type:'LIKE', value: titleSearch}],
      page: {limit: 100, offset: renewList ? 0 : cardLinkList.length}
    }).then(
      async (result: any) => {
        if(result.length == 0) {
          setStopInfiniteScroll(true)
        }
        await setCardLinkList(renewList ? result : [...cardLinkList, ...result])
      }
    )
  }

  const searchDescription = async (value: any) => {
    infiniteScrollLoad(true, value)
  }

  const addCardLink = () => {
    formBox.openModal(
      'Novo Link',
      'Informe o nome e o link',
      [
        {field: 'title', label: 'Nome', type: 'string', value: ''},
        {field: 'link', label: 'Link', type: 'string', value: ''}
      ]
    ).then(
      (res: any) => {
        if(res.role == 'confirm') {
          getDb({
            table: 'linksCard',
            filter: [{field: 'link', type:'=', value: res.data.link}]
          }).then(
            (resDb: any) => {
              if(resDb.length > 0) {
                alertConfirm.openModal('Link já existente', `Este link já está vinculado ao card: ${resDb[0].title}`)
              }else {
                insertDb({
                  table: 'linksCard',
                  values: [res.data]
                }).then(async () => {
                  await alertTimer.openModal('Sucesso', 'Link foi adicionado a lista', 1000)
                  infiniteScrollLoad(true)
                })
              }
            }
          )
        }
      }
    )
  }
  
  const updateCardLink = (card: any) => {
    formBox.openModal(
      'Atualizar Link',
      'Informe o nome e o link',
      [
        {field: 'title', label: 'Nome', type: 'string', value: card.title},
        {field: 'link', label: 'Link', type: 'string', value: card.link}
      ]
    ).then(
      (res: any) => {
        if(res.role == 'confirm') {
          getDb({
            table: 'linksCard',
            filter: [{field: 'link', type:'=', value: res.data.link}]
          }).then(
            (resDb: any) => {
              if(resDb.length > 0 && resDb[0]._id != card._id) {
                alertConfirm.openModal('Link já existente', `Este link já está vinculado ao card: ${resDb[0].title}`)
              }else {
                updateDb({
                  table: 'linksCard',
                  filter: [{field: '_id', type: '=', value: card._id}],
                  value: res.data
                }).then(async () => {
                  await alertTimer.openModal('Sucesso', 'Link foi atualizado no card', 1000)
                  infiniteScrollLoad(true)
                })
              }
            }
          )
        }
      }
    )
  }

  const browserCardLink = (card: any) => {
    Browser.open({url: card.link}).then(
      async () => {
        await alertTimer.openModal('Sucesso', 'Link do card copiado', 1000)
      }
    )
  }
  
  const clipboardCardLink = (card: any) => {
    Clipboard.write({url: card.link}).then(
      async () => {
        await alertTimer.openModal('Sucesso', 'Link do card copiado', 1000)
      }
    )
  }
  
  const shareCardLink = (card: any) => {
    Share.share({url: card.link}).then(
      async () => {
        await alertTimer.openModal('Sucesso', 'Link do card compartilhado', 1000)
      }
    )
  }

  useEffect(() => {
    Device.getLanguageTag().then(
      (languageTag: any) => {
        setLanguage(languageTag.value.slice(0,2))
      }
    ).finally(() => {
      if(initialized) {
        infiniteScrollLoad(true)
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
          <IonToolbar>
            <IonSearchbar enterkeyhint='search' value={searchText} onKeyUp={e=>{if(e.key == 'Enter'){searchDescription(e.currentTarget.value)}}}></IonSearchbar>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen id="main-content-home">
          <IonHeader collapse="condense">
          </IonHeader>
          <IonList style={{background:'none'}}>
            {cardLinkList.map((card: any) => (
              <IonCard key={card._id}>
                <IonCardHeader>
                  <IonCardTitle>{card.title}</IonCardTitle>
                  <IonCardSubtitle>{card.link}</IonCardSubtitle>
                </IonCardHeader>
                <IonGrid style={{textAlign:'center'}}>
                  <IonRow>
                    <IonCol><IonIcon icon={createOutline} onClick={() => {updateCardLink(card)}}/></IonCol>
                    <IonCol><IonIcon icon={linkOutline} onClick={() => {browserCardLink(card)}}/></IonCol>
                    <IonCol><IonIcon icon={shareSocialOutline} onClick={() => {shareCardLink(card)}}/></IonCol>
                    <IonCol><IonIcon icon={clipboardOutline} onClick={() => {clipboardCardLink(card)}}/></IonCol>
                  </IonRow>
                </IonGrid>
              </IonCard>
            ))}
          </IonList>
          <IonInfiniteScroll
            disabled = {stopInfiniteScroll}
            onIonInfinite={async (ev) => {
              await infiniteScrollLoad();
              ev.target.complete()
            }}
          >
            <IonInfiniteScrollContent color='primary'></IonInfiniteScrollContent>
          </IonInfiniteScroll>
          <IonFab slot="fixed" horizontal="end" vertical="bottom">
            <IonFabButton size='small' onClick={e => {addCardLink()}}>
              <IonIcon icon={addOutline}></IonIcon>
            </IonFabButton>
          </IonFab>
        </IonContent>
      </IonPage>
    </>
  );
};

export default Home;

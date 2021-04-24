import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link'
import Head from 'next/head'
import { api } from '../../services/api';
import {format, parseISO} from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { convertDurationToTimeString } from '../../utils/conver_duration';
import styles from './episode.module.scss'
import Image from 'next/image'
import {usePlayer} from '../context/playerContext';

type Episode = {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    duration: number;
    durationAsString: string;
    url: string;
    publishedAt: string;
    description: string;
};

type EpisodeProps ={
    episode: Episode;
}


export default function Episode({episode}: EpisodeProps){
    const {play} = usePlayer();
     return (
        <div className={styles.episodes}>

            <Head>
                <title>{episode.title}</title>
            </Head>
            <div className={styles.thumbnailContainer}>
                <Link href={'/'}>
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar"/>
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                />
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar Episodio"/>
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>  
            </header>

            <div 
                className={styles.description} 
                dangerouslySetInnerHTML={{__html: episode.description}}
            />
               
        </div>   
    )
}


export const getStaticPaths: GetStaticPaths = async () => {
    const {data} = await api.get('episodes', {
        params: {
          _limit:12,
          _order: 'desc',
          _sort: 'published_at'
    
        }
      })
    
    
    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })

    return {
        paths,
        fallback: 'blocking'
    }
}


export const getStaticProps: GetStaticProps = async (context) => {
    const {slug} = context.params;
    const {data} = await api.get(`/episodes/${slug}`)
    
    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url
    }
    return {
        props: {
            episode,
        },

        revalidate: 60 * 60 * 24,  // 24 horas
    }
}

// #missaocumprida
import { FormEvent, useState, useEffect } from 'react'
import { Header } from '../../components/header'
import { Input } from '../../components/input';

import { FiTrash } from 'react-icons/fi'
import { database } from '../../services/firebaseConection'
import {
    addDoc, //adicionar docu dentre deuma coleção
    collection, // 
    onSnapshot,//importar em tempo real
    query, //busca personalizada
    orderBy, // ordenação
    doc,//acessa item específico no banco
    deleteDoc
} from 'firebase/firestore'

interface linkProps {
    id: string;
    name: string;
    url: string;
    bg: string;
    color: string;
}

export function Admin() {
    const [nameInput, setNameInput] = useState("")
    const [urlInput, setUrlInput] = useState("")
    const [textColorInput, setTextColorInput] = useState("#f1f1f1")
    const [bacgroundColorInput, setBackgroundColorInput] = useState("#121212")

    const [links, setLinks] = useState<linkProps[]>([])

    useEffect(() => {
        const linksRef = collection(database, "links")//acess coleção de links
        const queryRef = query(linksRef, orderBy("created", "asc"))

        const unSub = onSnapshot(queryRef, (snapshot) => {
            let lista = [] as linkProps[];

            snapshot.forEach((doc) => {
                lista.push({
                    id: doc.id,
                    name: doc.data().name,
                    url: doc.data().url,
                    bg: doc.data().bg,
                    color: doc.data().color
                })

            })

            setLinks(lista);
        })

        return () => {//desmonta ao sair do componente
            unSub();
        }


    }, [])

    function handleRegiter(e: FormEvent) {
        e.preventDefault();

        if (nameInput === '' || urlInput === '') {
            alert('Preencha todos os campos')
            return;
        }

        addDoc(collection(database, "links"), {
            name: nameInput,
            url: urlInput,
            bg: bacgroundColorInput,
            color: textColorInput,
            created: new Date(),
        })

            .then(() => {
                console.log('CADASTRADO COM SUCESSO')
                setNameInput('')
                setUrlInput('')
            })
            .catch((error) => {
                console.log('ERRO AO CADASTRAR NO BANCO' + error)
            });

    }

    async function handleDeleteLink(id: string){
            const docRef = doc(database, "links", id)
            await deleteDoc(docRef)
    }

    return (
        <div className="flex items-center flex-col min-h-screen pb-7 px-2">
            <Header />

            <form className='flex flex-col mt-8 mb-3 w-full max-w-xl' onSubmit={handleRegiter}>
                <label className='text-white font-medium mt-2 mb-2 '>Nome do Link</label>
                <Input
                    placeholder='Digite o nome do Link...'
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                />

                <label className='text-white font-medium mt-2 mb-2 '>URL do Link</label>
                <Input
                    type="url"
                    placeholder='Digite a URL...'
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                />

                <section className='flex my-4 gap-5'>
                    <div className='flex gap-2'>
                        <label className='text-white font-medium mt-2 mb-2 '>Cor do Link</label>
                        <input
                            type='color' //mostra exadecimal
                            value={textColorInput}
                            onChange={(e) => setTextColorInput(e.target.value)}
                        />
                    </div>

                    <div className='flex gap-2'>
                        <label className='text-white font-medium mt-2 mb-2 '>Fundo do Link</label>
                        <input
                            type='color' //mostra exadecimal
                            value={bacgroundColorInput}
                            onChange={(e) => setBackgroundColorInput(e.target.value)}
                        />
                    </div>
                </section>

                {nameInput !== '' && (
                    <div className='flex items-center justify-center flex-col mb-7 p-1 border-gray-100/25 border rounded-md'>
                        <label className='text-white font-medium mt-2 mb-3'>Veja como está ficando:</label>
                        <article
                            className='w-11/12 max-w-lg flex flex-col items-center justify-between bg-zinc-900 rounded px-1 py-3'
                            style={{ marginBottom: 8, marginTop: 8, backgroundColor: bacgroundColorInput }}
                        >
                            <p className='font-medium' style={{ color: textColorInput }}>{nameInput}</p>
                        </article>
                    </div>
                )}

                <button type='submit' className='mb-7 bg-blue-600 rounded-md text-white font-medium gap-4 flex justify-center'>
                    Cadastrar

                    {/* quando o botão está dentro de form precisa dizer o type sunmit */}
                </button>
            </form>

            <h2 className='font-bold text-white mb-4 text-2xl'>
                Meus Links
            </h2>
            {links.map((link) => (
                <article
                key={link.id}
                    className='flex items-center justify-between w-11/12 max-w-xl rounded py-3 px-2 mb-2 select-none'
                    style={{ backgroundColor: link.bg, color: link.color }}
                >
                    <p>{link.name}</p>
                    <div>
                        <button
                            className='border border-dashed p-1 rounded bg-neutral-900'
                            onClick={() => handleDeleteLink(link.id)}
                        >
                            <FiTrash size={18} color='#FFF' />
                        </button>
                    </div>
                </article>
            ))}

        </div>

    )
}
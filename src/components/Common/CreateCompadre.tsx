"use client"

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/Common/Dialog'
import { Loader2, Plus, X } from 'lucide-react'
import { Input } from '@/components/Common/Input'   
import { Button } from '@/components/Common/Button'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'

type Props = {}

const CreateCompadre = (props: Props) => { // don't let unsubbed make more than 1 compadre
    const router = useRouter()
    const [input, setInput] = React.useState('');
    const [characteristics, setCharacteristics] = React.useState<string[]>([]); // Change to string array
    const [isSubscribed, setIsSubscribed] = React.useState(false);
    const [compadreCount, setCompadreCount] = React.useState(0);

    React.useEffect(() => {
        const checkSubscription = async () => {
            const res = await axios.get('/api/stripe/checkSubscription');
            const data = await res.data;
            setIsSubscribed(data.hasSubscription);
        };
        const checkCompadreCount = async () => {
            const res = await fetch('/api/getCompadreCount');
            const data = await res.json();
            setCompadreCount(data.count);
        }
        checkSubscription();
        checkCompadreCount();
    }, []);

    const createCompadre = useMutation({
        mutationFn: async () => {
            if (compadreCount >= 1 && !isSubscribed) {
                router.push('/subscription');
                return;
            }
            const response = await axios.post('/api/createCompadre', {
                name: input,
                characteristics: characteristics // Now this is correct
            })
            return response.data
        }
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input == ''){
            window.alert('Please enter a name for your Compadre.')
            return
        }

        createCompadre.mutate(undefined, {
            onSuccess: (data) => {
                if (data && data.compadre_id) {
                    console.log("Compadre Created", { compadre_id: data.compadre_id })
                    router.push(`/compadre/${data.compadre_id}`);
                } else {
                    console.error("Compadre created, but no ID returned")
                    window.alert("Compadre created, but there was an issue. Please try again.")
                }
            },
            onError: (error: any) => {
                console.error(error);
                let errorMessage = "Failed to create new Compadre";
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    errorMessage += `: ${error.response.data.message || error.response.statusText}`;
                } else if (error.request) {
                    // The request was made but no response was received
                    errorMessage += ": No response received from server";
                } else {
                    // Something happened in setting up the request that triggered an Error
                    errorMessage += `: ${error.message}`;
                }
                window.alert(errorMessage);
            },
        })
    };

  return (
    <Dialog>
        <DialogTrigger>
            <div className='border-dashed border-2 flex border-green-600 h-full rounded-lg items-center justify-center sm:flex-col hover: shadow-xl transition hover:-translate-y-1 flex-row p-4'>
                <Plus className="w-6 h-6 text-green-600" strokeWidth={3} />
                <h2 className='font-semibold text-green-600 sm:mt-2'>New Compadre</h2>
            </div>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    New Compadre
                </DialogTitle>

                <DialogDescription>
                    You can create a new compadre by clicking the button below. 
                </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
                <Input value={input} onChange={e => setInput(e.target.value)} placeholder='Name...' />
                <div className='h-4' />
                <div className="flex flex-col space-y-2">
                    {characteristics.map((char, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <Input
                                value={char}
                                onChange={(e) => {
                                    const newValue = e.target.value.replace(/\s/g, '');
                                    const newChars = [...characteristics];
                                    newChars[index] = newValue;
                                    setCharacteristics(newChars);
                                }}
                                placeholder="Enter a characteristic (single words only"
                                onKeyDown={(e) => {
                                    if (e.key === ' ') {
                                        e.preventDefault();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    const newChars = characteristics.filter((_, i) => i !== index);
                                    setCharacteristics(newChars);
                                }}
                                className="bg-red-500"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCharacteristics([...characteristics, ''])}
                    >
                        Add Characteristic
                    </Button>
                </div>
                <div className='h-4' />

                <div className='flex items-center gap-2'>
                    <Button type='button' variant={"secondary"}>Cancel</Button>
                    <Button className='bg-green-600' type="submit" disabled={createCompadre.isPending}>
                        {createCompadre.isPending && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                        Create
                    </Button>
                </div>
            
            </form>
        </DialogContent>
    </Dialog>
  )
}

export default CreateCompadre
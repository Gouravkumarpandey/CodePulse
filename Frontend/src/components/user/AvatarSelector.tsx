import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Dices } from 'lucide-react';

interface AvatarSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (avatarId: number) => void;
    currentAvatarId?: number;
}

const avatars = [
    { id: 1, name: 'Grass Cube', path: '/assets/avtar/icons8-minecraft-grass-cube-50.png' },
    { id: 2, name: 'Minecraft Logo', path: '/assets/avtar/icons8-minecraft-logo-50.png' },
    { id: 3, name: 'Steve', path: '/assets/avtar/icons8-minecraft-main-character-50.png' },
    { id: 4, name: 'Steve Alt', path: '/assets/avtar/icons8-minecraft-main-character-50-2.png' },
];

const AvatarSelector = ({ isOpen, onClose, onSelect, currentAvatarId }: AvatarSelectorProps) => {
    const [selected, setSelected] = useState(currentAvatarId || 1);

    const handleRandom = () => {
        const randomId = Math.floor(Math.random() * avatars.length) + 1;
        setSelected(randomId);
    };

    const handleSave = () => {
        onSelect(selected);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-slate-900 border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <h3 className="text-xl font-bold text-white uppercase tracking-widest" style={{ fontFamily: '"Minecraftia", sans-serif' }}>
                                Choose Avatar
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                {avatars.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        onClick={() => setSelected(avatar.id)}
                                        className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-110 shadow-lg bg-white/5 border-2 ${selected === avatar.id ? 'border-blue-500 scale-110 bg-blue-500/10' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <div className="w-full h-full flex items-center justify-center p-2">
                                            <img src={avatar.path} alt={avatar.name} className="w-full h-full object-contain" />
                                        </div>
                                        {selected === avatar.id && (
                                            <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5 shadow-lg">
                                                <Check className="w-2 h-2 text-white" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleRandom}
                                    className="flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all border border-white/10 group"
                                >
                                    <Dices className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                                    Random Avatar
                                </button>

                                <button
                                    onClick={handleSave}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20"
                                    style={{ fontFamily: '"Minecraftia", sans-serif' }}
                                >
                                    Save Avatar
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AvatarSelector;

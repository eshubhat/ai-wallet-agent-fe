import { useState, useEffect } from 'react';
import { contactService, type Contact } from '../../services/contact.service';
import { Users, X, Plus, Trash2 } from 'lucide-react';

interface ContactsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ContactsModal({ isOpen, onClose }: ContactsModalProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [newName, setNewName] = useState('');
    const [newAddress, setNewAddress] = useState('');
    const [error, setError] = useState('');

    const fetchContacts = async () => {
        const data = await contactService.getContacts();
        setContacts(data);
    };

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
            setError('');
            setNewName('');
            setNewAddress('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddContact = async () => {
        if (!newName.trim() || !newAddress.trim()) {
            setError('Name and address are required.');
            return;
        }

        // Basic solana address length check roughly
        if (newAddress.trim().length < 32 || newAddress.trim().length > 44) {
            setError('Invalid Solana address length.');
            return;
        }

        const normalizedName = newName.trim().toLowerCase();

        // Prevent strictly reserved keywords or duplicates
        if (contacts.some(c => c.name.toLowerCase() === normalizedName)) {
            setError('A contact with this name already exists.');
            return;
        }

        const newContact: Contact = {
            id: crypto.randomUUID(),
            name: newName.trim(),
            address: newAddress.trim()
        };

        try {
            await contactService.addContact(newContact);
            await fetchContacts();
            setNewName('');
            setNewAddress('');
            setError('');
        } catch (e: any) {
            setError(e.response?.data?.error || 'Failed to add contact');
        }
    };

    const handleDeleteContact = async (id: string) => {
        try {
            await contactService.removeContact(id);
            await fetchContacts();
        } catch (e) {
            console.error('Failed to delete contact:', e);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 300, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '500px', padding: '24px', borderRadius: '16px',
                display: 'flex', flexDirection: 'column', gap: '20px',
                maxHeight: '80vh', overflowY: 'auto',
                backgroundColor: '#1a1b23',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                        <Users size={24} /> Contacts Manager
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Add New Contact</h3>
                    {error && <div style={{ color: 'var(--error)', fontSize: '0.9rem' }}>{error}</div>}
                    <input
                        type="text"
                        placeholder="Name (e.g. rahul)"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    />
                    <input
                        type="text"
                        placeholder="Solana Address (Base58)"
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    />
                    <button
                        onClick={handleAddContact}
                        className="pulse-effect"
                        style={{
                            padding: '10px', borderRadius: '8px', border: 'none',
                            background: 'var(--primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                        }}
                    >
                        <Plus size={18} /> Save Contact
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Saved Contacts</h3>
                    {contacts.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>No contacts saved yet.</p>
                    ) : (
                        contacts.map(contact => (
                            <div key={contact.id} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 'bold' }}>@{contact.name}</span>
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>{contact.address.slice(0, 6)}...{contact.address.slice(-6)}</span>
                                </div>
                                <button
                                    onClick={() => handleDeleteContact(contact.id)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '4px' }}
                                    title="Delete contact"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

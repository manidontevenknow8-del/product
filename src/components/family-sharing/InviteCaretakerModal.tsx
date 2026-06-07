import { useEffect, useState, type FormEvent } from 'react';
import { Button, Input } from '@/components/ui';
import { PermissionSelector } from './PermissionSelector';
import type { CaretakerPermission, SharedPet } from '@/types/familySharing';
import styles from './InviteCaretakerModal.module.css';

type InviteCaretakerModalProps = {
  isOpen: boolean;
  sharedPets: SharedPet[];
  onClose: () => void;
  onSubmit: (input: {
    name: string;
    email: string;
    permission: CaretakerPermission;
    petIds: string[];
  }) => Promise<void>;
};

export function InviteCaretakerModal({
  isOpen,
  sharedPets,
  onClose,
  onSubmit,
}: InviteCaretakerModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<CaretakerPermission>('view_only');
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setEmail('');
      setPermission('view_only');
      setSelectedPetIds(sharedPets.map((p) => p.id));
    }
  }, [isOpen, sharedPets]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const togglePet = (petId: string) => {
    setSelectedPetIds((prev) =>
      prev.includes(petId)
        ? prev.filter((id) => id !== petId)
        : [...prev, petId],
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || selectedPetIds.length === 0) return;
    setLoading(true);
    await onSubmit({ name, email, permission, petIds: selectedPetIds });
    setLoading(false);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="invite-title"
      >
        <div className={styles.header}>
          <h2 id="invite-title" className={styles.title}>
            Invite a caretaker
          </h2>
          <p className={styles.subtitle}>
            Share access with family, partners, or pet sitters who help care for your pet.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Sarah Chen"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sarah@email.com"
            required
          />

          <div>
            <h3 className={styles.sectionTitle}>Shared pets</h3>
            <div className={styles.petChecks}>
              {sharedPets.map((pet) => (
                <label
                  key={pet.id}
                  className={`${styles.petCheck} ${
                    selectedPetIds.includes(pet.id) ? styles.petCheckSelected : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPetIds.includes(pet.id)}
                    onChange={() => togglePet(pet.id)}
                  />
                  {pet.name} ({pet.species})
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className={styles.sectionTitle}>Permission level</h3>
            <PermissionSelector value={permission} onChange={setPermission} />
          </div>

          <div className={styles.actions}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Sending…' : 'Send invitation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

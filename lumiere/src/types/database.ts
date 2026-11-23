export type UserRole = "admin" | "fotografo" | "cliente";
export type BookingStatus = "pendente" | "confirmado" | "cancelado" | "concluido";
export type LocationType = "estudio" | "externo";

export type Profile = {
  id: string;
  nome: string;
  telefone: string | null;
  role: UserRole;
  created_at: string;
};

export type Service = {
  id: string;
  nome: string;
  descricao: string | null;
  duracao_min: number;
  preco: number;
  fotos_entregues: number;
  ativo: boolean;
  created_at: string;
};

export type Location = {
  id: string;
  nome: string;
  endereco: string | null;
  tipo: LocationType;
  ativo: boolean;
  created_at: string;
};

export type Photographer = {
  profile_id: string;
  especialidade: string | null;
  portfolio_url: string | null;
  ativo: boolean;
  created_at: string;
};

export type PhotographerWithProfile = Photographer & {
  profiles: Pick<Profile, "nome" | "telefone">;
};

export type Booking = {
  id: string;
  client_id: string;
  photographer_id: string;
  service_id: string;
  location_id: string;
  starts_at: string;
  ends_at: string;
  status: BookingStatus;
  observacoes: string | null;
  link_galeria: string | null;
  created_at: string;
};

type Table<
  Row,
  Insert = Partial<Row>,
  Update = Partial<Insert>,
  Relationships extends {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[] = [],
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      services: Table<Service>;
      locations: Table<Location>;
      photographers: Table<
        Photographer,
        Partial<Photographer>,
        Partial<Photographer>,
        [{
          foreignKeyName: "photographers_profile_id_fkey";
          columns: ["profile_id"];
          isOneToOne: true;
          referencedRelation: "profiles";
          referencedColumns: ["id"];
        }]
      >;
      bookings: Table<Booking>;
    };
    Views: Record<string, never>;
    Functions: {
      current_role_name: { Args: Record<string, never>; Returns: string | null };
      create_photographer: {
        Args: {
          p_profile_id: string;
          p_especialidade: string | null;
          p_portfolio_url: string | null;
          p_ativo: boolean;
        };
        Returns: Photographer;
      };
      delete_photographer: {
        Args: { p_profile_id: string };
        Returns: Photographer | null;
      };
    };
    Enums: {
      user_role: UserRole;
      booking_status: BookingStatus;
      location_type: LocationType;
    };
    CompositeTypes: Record<string, never>;
  };
};
